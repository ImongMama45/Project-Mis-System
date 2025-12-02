from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StaffProfile
        fields = ['id', 'user', 'role', 'contact_number', 'specialization']




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = StaffProfile
        fields = [
            "id",
            "user",
            "role",
            "contact_number",
            "specialization",
        ]
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, default="user")  # Add role field
    
    class Meta:
        model = User
        fields = ["username", "password", "first_name", "last_name", "email", "role"]
    
    def create(self, validated_data):
        # Extract role before creating user
        role = validated_data.pop('role', 'user')
        
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
        )
        
        # Update the staff profile with the specified role
        try:
            staff_profile = user.staffprofile
            staff_profile.role = role
            staff_profile.save()
        except StaffProfile.DoesNotExist:
            # If signal didn't create it, create it now
            StaffProfile.objects.create(user=user, role=role)
        
        return user