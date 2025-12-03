from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    get_user_profile, 
    debug_all_users, 
    debug_user,
    get_all_staff,
    StaffProfileViewSet,
    CurrentUserStaffProfileView
)
from rest_framework.permissions import AllowAny

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

# Create router for ViewSet (for managing all staff profiles - admin only)
router = DefaultRouter()
router.register(r'staff-management', StaffProfileViewSet, basename='staff-management')

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    
    # Current user profile endpoints
    path("profile/", get_user_profile, name="user-profile"),  # Detailed profile with nested data
    path('staffprofile/', CurrentUserStaffProfileView.as_view(), name='current-user-profile'),  # Simple profile
    
    # Staff management (admin only)
    path('staff/all/', get_all_staff, name='all-staff'),  # List all staff for dropdown
    
    # Debug endpoints
    path('debug/', debug_user, name="debug"),
    path("debug-all/", debug_all_users, name="debug_all"),
    
    # Include router URLs for CRUD operations on staff
    path('', include(router.urls)),
]