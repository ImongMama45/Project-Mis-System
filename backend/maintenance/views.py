from rest_framework import generics, permissions, viewsets
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


# Staff + admin can see all
class ListRequestsView(generics.ListAPIView):
    queryset = MaintenanceRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]


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
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            maintenance_request = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
        
        # Update status
        status = request.data.get('status')
        if status:
            maintenance_request.status = status
        
        # ✅ CRITICAL FIX: Handle assigned_to
        assigned_to = request.data.get('assigned_to')
        if assigned_to:
            try:
                # Convert to integer and get the User
                user_id = int(assigned_to)
                user = User.objects.get(id=user_id)
                maintenance_request.assigned_to = user
                print(f"✅ Assigned request #{pk} to user: {user.username} (ID: {user_id})")
            except (ValueError, User.DoesNotExist) as e:
                print(f"❌ Error assigning user: {e}")
                return Response({"error": f"Invalid user ID: {assigned_to}"}, status=400)
        
        # Update notes
        notes = request.data.get('notes', '')
        if notes:
            maintenance_request.completion_notes = notes
        
        # Handle image upload
        if request.FILES.get('image'):
            maintenance_request.completion_photo = request.FILES['image']
        
        # Save the changes
        maintenance_request.save()
        print(f"✅ Saved maintenance request #{pk} - assigned_to: {maintenance_request.assigned_to}")
        
        serializer = MaintenanceRequestSerializer(maintenance_request)
        return Response(serializer.data)