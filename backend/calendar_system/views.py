# calendar_system/views.py - UPDATED VERSION
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MaintenanceSchedule
from .serializers import MaintenanceScheduleSerializer
from maintenance.models import MaintenanceRequest


class SetScheduleView(APIView):
    """Create or update a schedule for a maintenance request"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Get the maintenance request
        try:
            maintenance_request = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

        # Extract data
        schedule_date = request.data.get("schedule_date")
        estimated_duration = request.data.get("estimated_duration", "")
        assigned_staff_id = request.data.get("assigned_staff")

        if not schedule_date:
            return Response({"error": "schedule_date is required"}, status=400)

        # Check if schedule already exists
        schedule, created = MaintenanceSchedule.objects.update_or_create(
            request=maintenance_request,
            defaults={
                "schedule_date": schedule_date,
                "estimated_duration": estimated_duration,
                "assigned_staff_id": assigned_staff_id if assigned_staff_id else None,
            }
        )

        serializer = MaintenanceScheduleSerializer(schedule)
        return Response(
            {
                **serializer.data,
                "created": created,
                "message": "Schedule created successfully" if created else "Schedule updated successfully",
            },
            status=201 if created else 200,
        )


class CalendarMonthView(APIView):
    """Get all schedules for a specific month"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")
        month = request.query_params.get("month")

        # ✅ DEBUG: Print what we received
        print(f"📅 CalendarMonthView called with year={year}, month={month}")

        if not year or not month:
            return Response({"error": "year and month required"}, status=400)

        # ✅ CRITICAL FIX: Add select_related and prefetch_related
        # This fetches all nested data in ONE query instead of N+1 queries
        schedules = MaintenanceSchedule.objects.filter(
            schedule_date__year=year, 
            schedule_date__month=month
        ).select_related(
            "request",  # Fetch the maintenance request
            "request__building",  # Fetch the building
            "request__floor",  # Fetch the floor
            "request__room",  # Fetch the room
            "request__assigned_to",  # Fetch assigned user
            "assigned_staff"  # Fetch schedule assigned staff
        ).exclude(
            request__status='for_approval'  # ✅ Exclude for_approval at DB level
        )

        # ✅ DEBUG: Print query results
        print(f"📊 Found {schedules.count()} schedules for {year}-{month}")
        for schedule in schedules:
            print(f"  - Schedule #{schedule.id}: {schedule.schedule_date}, Request: #{schedule.request.id}, Status: {schedule.request.status}")

        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        
        # ✅ DEBUG: Print serialized data
        print(f"📤 Returning {len(serializer.data)} schedules")
        
        return Response(serializer.data)


# ✅ BONUS: Add this view to get ALL schedules (for debugging/fallback)
class CalendarAllView(APIView):
    """Get all schedules (for debugging or if month filter doesn't work)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        print("📅 CalendarAllView called - fetching ALL schedules")
        
        schedules = MaintenanceSchedule.objects.all().select_related(
            "request",
            "request__building",
            "request__floor",
            "request__room",
            "request__assigned_to",
            "assigned_staff"
        ).exclude(
            request__status='for_approval'
        )

        print(f"📊 Total schedules: {schedules.count()}")
        
        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        return Response(serializer.data)