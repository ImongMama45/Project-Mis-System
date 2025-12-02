from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import Count
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Building, Floor, Room
from .serializers import BuildingSerializer, FloorSerializer, RoomSerializer


class BuildingIssuesViewSet(viewsets.ViewSet):
    """
    Returns buildings with an annotation of whether they have issues.
    """

    def list(self, request):
        buildings = Building.objects.annotate(
            issue_count=Count("maintenancerequest")
        ).values(
            "id",
            "name",
            "issue_count",
            "total_floors"
        )

        # Convert issue_count into a boolean for easier frontend logic
        for b in buildings:
            b["has_issue"] = b["issue_count"] > 0

        return Response(buildings)

class BuildingListCreateView(generics.ListCreateAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [IsAuthenticated]


class BuildingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [IsAuthenticated]


class FloorListView(generics.ListAPIView):
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        building_id = self.kwargs["building_id"]
        return Floor.objects.filter(building_id=building_id)


class RoomListView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        floor_id = self.kwargs.get("floor_id", None)
        building_id = self.kwargs.get("building_id", None)

        if floor_id is None:
            return Room.objects.filter(building_id=building_id)
        return Room.objects.filter(floor_id=floor_id)