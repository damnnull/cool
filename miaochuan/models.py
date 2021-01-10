from django.db import models


class File(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    fileHash = models.CharField(max_length=100)
    download = models.CharField(max_length=100)
    time = models.DateField()

    def __str__(self):
        return self.name
