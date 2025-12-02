from django.urls import path
from .views import (
    BuildingListCreateView,
    BuildingDetailView,
    FloorListView,
    RoomListView,
)

urlpatterns = [
    path("buildings/", BuildingListCreateView.as_view()),
    path("buildings/<int:pk>/", BuildingDetailView.as_view()),
    path("buildings/<int:building_id>/floors/", FloorListView.as_view()),
    path("buildings/<int:building_id>/rooms/", RoomListView.as_view()),
    path("floors/<int:floor_id>/rooms/", RoomListView.as_view()),
]   