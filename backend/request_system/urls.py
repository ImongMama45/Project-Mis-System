<<<<<<< HEAD
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RequestViewSet

router = DefaultRouter()
router.register(r'', RequestViewSet, basename='request')

urlpatterns = [
    path('', include(router.urls)),
]
=======
from rest_framework import routers
from .views import RequestViewSet

router = routers.DefaultRouter()
router.register(r"", RequestViewSet, basename="requests")

urlpatterns = router.urls
>>>>>>> d006c14ab8afd99bc602c07d6e77837df49fa821
