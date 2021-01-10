
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('miaochuan.urls')),
    path('admin/', admin.site.urls),
]
