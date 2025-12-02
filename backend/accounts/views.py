from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer,StaffProfileSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from .models import StaffProfile

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        # Save the user with the role
        serializer.save()

class StaffProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing staff profiles
    """
    queryset = StaffProfile.objects.all().select_related('user')
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get all staff profiles"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new staff member"""
        try:
            # Create user
            user_data = {
                'username': request.data.get('username'),
                'email': request.data.get('email'),
                'first_name': request.data.get('first_name'),
                'last_name': request.data.get('last_name'),
                'is_active': request.data.get('is_active', True)
            }
            
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=request.data.get('password'),
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                is_active=user_data['is_active']
            )
            
            # Create staff profile
            staff_profile = StaffProfile.objects.create(
                user=user,
                role=request.data.get('role', 'staff'),
                contact_number=request.data.get('contact_number', ''),
                specialization=request.data.get('specialization', '')
            )
            
            serializer = self.get_serializer(staff_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, pk=None):
        """Update a staff member"""
        try:
            staff_profile = self.get_object()
            user = staff_profile.user
            
            # Update user fields
            user.username = request.data.get('username', user.username)
            user.email = request.data.get('email', user.email)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.is_active = request.data.get('is_active', user.is_active)
            
            # Update password if provided
            password = request.data.get('password')
            if password:
                user.set_password(password)
            
            user.save()
            
            # Update staff profile fields
            staff_profile.role = request.data.get('role', staff_profile.role)
            staff_profile.contact_number = request.data.get('contact_number', staff_profile.contact_number)
            staff_profile.specialization = request.data.get('specialization', staff_profile.specialization)
            staff_profile.save()
            
            serializer = self.get_serializer(staff_profile)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, pk=None):
        """Delete a staff member"""
        try:
            staff_profile = self.get_object()
            user = staff_profile.user
            user.delete()  # This will cascade delete the staff profile
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    try:
        staff_profile = user.staffprofile
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': staff_profile.role,  # Return role directly
            'staff_profile': {
                'role': staff_profile.role,
                'contact_number': staff_profile.contact_number,
                'specialization': staff_profile.specialization,
            }
        })
    except Exception as e:
        # If no staff profile exists, return basic user info
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': 'user'
        })
    
# accounts/views.py

import logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    logger.info(f"Profile requested for user: {user.username}")
    
    try:
        staff_profile = user.staffprofile
        logger.info(f"Staff profile found - Role: {staff_profile.role}")
        
        response_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': staff_profile.role,
            'staff_profile': {
                'role': staff_profile.role,
                'contact_number': staff_profile.contact_number,
                'specialization': staff_profile.specialization,
            }
        }
        logger.info(f"Returning profile data: {response_data}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': 'user',
            'error': str(e)
        })

# accounts/views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_user(request):
    """Debug endpoint to see user and profile data"""
    user = request.user
    try:
        staff_profile = user.staffprofile
        return Response({
            'user_id': user.id,
            'username': user.username,
            'has_staff_profile': True,
            'staff_profile_role': staff_profile.role,
            'staff_profile_id': staff_profile.id,
        })
    except:
        return Response({
            'user_id': user.id,
            'username': user.username,
            'has_staff_profile': False,
            'error': 'No staff profile found'
        })

@api_view(['GET'])
@permission_classes([AllowAny])  # TEMPORARY - Remove after debugging
def debug_all_users(request):
    """Debug endpoint to see all users and roles"""
    users_data = []
    for user in User.objects.all():
        try:
            profile = user.staffprofile
            users_data.append({
                'username': user.username,
                'has_profile': True,
                'role': profile.role,
            })
        except:
            users_data.append({
                'username': user.username,
                'has_profile': False,
                'role': None,
            })
    return Response(users_data)