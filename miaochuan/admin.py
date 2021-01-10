from django.contrib import admin

from .models import File


class FileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'fileHash', 'time')


admin.site.register(File, FileAdmin)
