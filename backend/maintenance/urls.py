from django.urls import path
from .views import (
    CreateRequestView,
    ListRequestsView,
    ClaimRequestView,
    CompleteRequestView,
    UpdateStatusView,
)

urlpatterns = [
    path("requests/", ListRequestsView.as_view(), name="list_requests"),
    path("requests/create/", CreateRequestView.as_view(), name="create_request"),
    path("requests/<int:pk>/claim/", ClaimRequestView.as_view(), name="claim_request"),
    path("requests/<int:pk>/complete/", CompleteRequestView.as_view(), name="complete_request"),
    path("requests/<int:pk>/update-status/", UpdateStatusView.as_view(), name="update_status"),
]