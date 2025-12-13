"""
Helper functions for creating notifications
Place this in: notifications/helpers.py
"""

from django.contrib.auth.models import User
from notifications.models import Notification


def notify_admins(message, maintenance_request=None):
    """
    Send notification to all admin users
    
    Args:
        message (str): Notification message
        maintenance_request (MaintenanceRequest, optional): Related request
    """
    admin_users = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
    admin_users = admin_users.distinct()
    
    for admin in admin_users:
        Notification.objects.create(
            user=admin,
            message=message,
            maintenance_request=maintenance_request,
        )


def notify_user(user, message, maintenance_request=None):
    """
    Send notification to a specific user
    
    Args:
        user (User): User to notify
        message (str): Notification message
        maintenance_request (MaintenanceRequest, optional): Related request
    """
    if user:
        Notification.objects.create(
            user=user,
            message=message,
            maintenance_request=maintenance_request,
        )


def notify_staff_and_admins(message, maintenance_request=None, exclude_user=None):
    """
    Send notification to all staff and admins, optionally excluding a user
    
    Args:
        message (str): Notification message
        maintenance_request (MaintenanceRequest, optional): Related request
        exclude_user (User, optional): User to exclude from notifications
    """
    users = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
    users = users.distinct()
    
    if exclude_user:
        users = users.exclude(id=exclude_user.id)
    
    for user in users:
        Notification.objects.create(
            user=user,
            message=message,
            maintenance_request=maintenance_request,
        )