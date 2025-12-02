from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

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

        # Get the staff profile
        try:
            staff_profile = request.user.staffprofile
            maintenance.assigned_to = staff_profile
        except:
            return Response({"error": "User is not a staff member"}, status=403)
            
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
            
        serializer = CompleteRequestSerializer(
            maintenance, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save(status="completed")
            return Response({"message": "Request completed"})
        return Response(serializer.errors, status=400)


# Update status endpoint
class UpdateStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            maintenance_request = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
            
        status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if status:
            maintenance_request.status = status
            
        if notes:
            maintenance_request.completion_notes = notes
        
        if request.FILES.get('image'):
            maintenance_request.completion_photo = request.FILES['image']
        
        maintenance_request.save()
        
        serializer = MaintenanceRequestSerializer(maintenance_request)
        return Response(serializer.data)