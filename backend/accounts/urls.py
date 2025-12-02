
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    get_user_profile, 
    debug_all_users, 
    debug_user,
    StaffProfileViewSet  # Import the new viewset
)
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

class CustomTokenObtainPairView(BaseTokenObtainPairView):
    permission_classes = [AllowAny]

class CustomTokenRefreshView(BaseTokenRefreshView):
    permission_classes = [AllowAny]

# Create router for ViewSet
router = DefaultRouter()
router.register(r'staffprofile', StaffProfileViewSet, basename='staffprofile')

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    path("profile/", get_user_profile, name="profile"),
    path('debug/', debug_user, name="debug"),
    path("debug-all/", debug_all_users, name="debug_all"),
    
    # Include router URLs - this creates the /staffprofile/ endpoints
    path('', include(router.urls)),
]