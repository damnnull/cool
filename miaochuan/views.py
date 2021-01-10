from django.db.models import Q
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import render
from miaochuan.models import File
from datetime import datetime


def upload_file(request):
    if request.method == 'POST':
        file = request.FILES['file']
        hash = request.POST.get("hash")
        filePath = "download/" + file.name
        file_db = File.objects.filter(Q(fileHash__icontains=hash))
        if len(file_db) > 0:
            file_new = File(name=file.name, fileHash=file_db[0].fileHash, download="/download/?name=" + file.name,
                            time=datetime.now())
            file_new.save()
            return JsonResponse({"code": 200, "msg": "秒传成功!", "file": file_new.download}, safe=False)
        else:
            file_new = File(name=file.name, fileHash=hash, download="/download/?name=" + file.name,
                            time=datetime.now())
            file_new.save()
            with open(filePath, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            return JsonResponse({"code": 200, "msg": "上传成功!", "file": file_new.download}, safe=False)
    else:
        return render(request, 'upload.html')



def download_file(request):
    FileName = request.GET.get("name")
    file = open("download/" + FileName, 'rb')
    response = StreamingHttpResponse(file)
    response['Content-Type'] = 'application/octet-stream'
    response['Content-Disposition'] = 'attachment;filename=%s' % FileName
    return response
