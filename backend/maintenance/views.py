# maintenance/views.py
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User

from .models import MaintenanceRequest
from .serializers import (
    MaintenanceRequestSerializer,
    ClaimRequestSerializer,
    CompleteRequestSerializer,
)


# Anyone can submit
class CreateRequestView(generics.CreateAPIView):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer
    
    def perform_create(self, serializer):
        # Log the incoming data for debugging
        print("Creating maintenance request with data:", self.request.data)
        serializer.save()


# Staff + admin can see all
class ListRequestsView(generics.ListAPIView):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MaintenanceRequest.objects.all().order_by("-created_at")
        
        # ✅ Filter by room if provided
        room_id = self.request.query_params.get('room', None)
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        
        # ✅ Filter by building if provided
        building_id = self.request.query_params.get('building', None)
        if building_id:
            queryset = queryset.filter(building_id=building_id)
        
        # ✅ Filter by floor if provided
        floor_id = self.request.query_params.get('floor', None)
        if floor_id:
            queryset = queryset.filter(floor_id=floor_id)
        
        return queryset


class ListUserRequestsView(generics.ListAPIView):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Try to get role from staff_profile or check if superuser
        try:
            # Check if user is superuser (admin)
            if user.is_superuser or user.is_staff:
                return MaintenanceRequest.objects.all().order_by("-created_at")
            
            # Check if user has staff_profile
            if hasattr(user, 'staff_profile'):
                role = user.staff_profile.role.lower()
                # Staff and maintenance staff see all requests
                if 'staff' in role or role == 'admin' or role == 'administrator':
                    return MaintenanceRequest.objects.all().order_by("-created_at")
        except AttributeError:
            pass  # User doesn't have staff_profile, treat as regular user
        
        # Regular users see only their own requests
        return MaintenanceRequest.objects.filter(
            requester_name__iexact=user.username
        ).order_by("-created_at")


# ✅ NEW: Approve/Reject endpoint
class ApproveRejectRequestView(APIView):
    """Admin can approve or reject maintenance requests"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            maintenance = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

        new_status = request.data.get('status')
        rejection_reason = request.data.get('rejection_reason', '')

        # Validate status
        valid_statuses = ['pending', 'approved', 'rejected', 'in_progress', 'completed']
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
                status=400
            )

        # Update status
        maintenance.status = new_status
        
        # Save rejection reason if rejecting
        if new_status == 'rejected':
            if rejection_reason and rejection_reason.strip():
                maintenance.rejection_reason = rejection_reason
            else:
                # If no reason provided but status is rejected, require it
                return Response(
                    {"error": "Rejection reason is required when rejecting a request"},
                    status=400
                )
        
        # Handle assigned_to if provided (admin assignment)
        assigned_to = request.data.get('assigned_to')
        if assigned_to is not None:  # Check for None to allow empty string
            if assigned_to == '':  # Unassign
                maintenance.assigned_to = None
            else:
                try:
                    user_id = int(assigned_to)
                    user = User.objects.get(id=user_id)
                    maintenance.assigned_to = user
                except (ValueError, User.DoesNotExist):
                    return Response({"error": "Invalid user ID"}, status=400)
        
        maintenance.save()
        
        serializer = MaintenanceRequestSerializer(maintenance)
        return Response(serializer.data)


class AnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Pre-calculated analytics
        # This would be more efficient than processing on frontend
        return Response({
            'avg_response_time': 0,
            'avg_completion_time': 0,
            # etc.
        })


# Staff claims a request
class ClaimRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            maintenance = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
            
        if maintenance.assigned_to is not None:
            return Response({"error": "Already taken"}, status=400)

        # Assign to the user directly (not staff profile)
        maintenance.assigned_to = request.user
        maintenance.status = "in_progress"
        maintenance.save()
        return Response({"message": "Request claimed successfully"})


# Staff completes the task
class CompleteRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            maintenance = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
        
        # ✅ Handle assigned_to if provided (admin only)
        assigned_to = request.data.get('assigned_to')
        if assigned_to:
            try:
                user_id = int(assigned_to)
                user = User.objects.get(id=user_id)
                maintenance.assigned_to = user
            except (ValueError, User.DoesNotExist):
                return Response({"error": "Invalid user ID"}, status=400)
            
        serializer = CompleteRequestSerializer(
            maintenance, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save(status="completed")
            return Response({"message": "Request completed"})
        return Response(serializer.errors, status=400)


# ✅ FIXED: Update status endpoint
class UpdateStatusView(APIView):
    """Update maintenance request status and details"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            maintenance_request = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
        
        # Use the serializer to validate and save
        serializer = CompleteRequestSerializer(
            maintenance_request, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return the full request data
            response_serializer = MaintenanceRequestSerializer(maintenance_request)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=400)


class MaintenanceDetailView(APIView):
    """Get detailed information about a single maintenance request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            maintenance = MaintenanceRequest.objects.select_related(
                'building', 'floor', 'room', 'assigned_to', 'created_by'
            ).get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
        
        serializer = MaintenanceRequestSerializer(maintenance)
        
        # Also include schedule if exists
        schedule = None
        if hasattr(maintenance, 'schedule'):
            from calendar_system.serializers import MaintenanceScheduleSerializer
            schedule = MaintenanceScheduleSerializer(maintenance.schedule).data
        
        return Response({
            "request": serializer.data,
            "schedule": schedule
        })