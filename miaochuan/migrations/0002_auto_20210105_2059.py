# Generated by Django 3.1.5 on 2021-01-05 12:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('miaochuan', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='id',
            field=models.AutoField(max_length=50, primary_key=True, serialize=False),
        ),
    ]
