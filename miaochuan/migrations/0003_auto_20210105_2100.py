# Generated by Django 3.1.5 on 2021-01-05 13:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('miaochuan', '0002_auto_20210105_2059'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
