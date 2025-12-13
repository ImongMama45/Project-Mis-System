# calendar_system/urls.py - UPDATED
from django.urls import path
from .views import SetScheduleView, CalendarMonthView, CalendarAllView


urlpatterns = [
    path("schedule/<int:pk>/", SetScheduleView.as_view(), name="set_schedule"),
    path("calendar/month/", CalendarMonthView.as_view(), name="calendar_month"),
    path("calendar/", CalendarAllView.as_view(), name="calendar_all"),  # ✅ NEW: Fallback endpoint
]