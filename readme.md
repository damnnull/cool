 # 实验报告

## 作业一

### 介绍

1、在虚拟机中安装Linux服务器版本操作系统

2、配置虚拟机网络为桥接。虚拟机开机后，查看虚拟主机地址（使用ifconfig命令）。

3、可以在host主机中ping通虚拟机内的guest主机，也可以在guest主机中ping通host主机。

4、在guest主机中开通http server服务。可以通过python3自带的http模块（使用课堂上演示的命令）。在host主机中可以通过浏览器访问guest主机中的http服务中的html文件。

5、在云主机中重复4，使用本地浏览器通过ip访问到远程云主机的http服务。

### 内容

1. 虚拟机安装Ubuntu16

   创建虚拟机：

![image-20210110115331709](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110115331709.png)

分配资源：

![image-20210110115503625](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110115503625.png)

选择ISO:

![image-20210110115523446](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110115523446.png)

安装完成并登录虚拟机：

![image-20210110115601695](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110115601695.png)

2. 使用桥接网络

   ![image-20210110120524779](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110120524779.png)

   

3. ifconfig查看ip

   没有net-tools，无法使用ifconfig

   ![image-20210110120554557](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110120554557.png)

   guest主机ip为192.168.5.220

   ![image-20210110120623527](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110120623527.png)

   Host主机ip为192.168.5.135

   ![image-20210110120643186](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110120643186.png)

   

4. 互ping测试

   互ping可通：

   guest ping host:

   ![image-20210110120727578](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110120727578.png)

   Host ping guest

   ![image-20210110120747388](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110120747388.png)

   

5. 安装http服务

   安装http服务：

   ![image-20210110121446663](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110121446663.png)

   curl命令测试正常：

   ![image-20210110121508923](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110121508923.png)

   

6. 通过浏览器测试

   浏览器打开正常:

   ![image-20210110121527034](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110121527034.png)

   从host主机的浏览器打开正常:

   ![image-20210110121611784](C:\Users\14272\AppData\Roaming\Typora\typora-user-images\image-20210110121611784.png)

   

  

## 作业二

### 介绍

主要的技能点：

- 1、关系型数据库设计和ORM、推荐使用Django；

- 2、用户系统；Django框架直接有不用开发。

- 3、前端Hash值计算、可以找开源的工具；

- 4、Web端文件上传和下载。

  

### 关键代码

#### 定义模型类

class File(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    fileHash = models.CharField(max_length=100)
    download = models.CharField(max_length=100)
    time = models.DateField()

    def __str__(self):
        return self.name
#### 上传文件

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

#### 下载文件

def download_file(request):
    FileName = request.GET.get("name")
    file = open("download/" + FileName, 'rb')
    response = StreamingHttpResponse(file)
    response['Content-Type'] = 'application/octet-stream'
    response['Content-Disposition'] = 'attachment;filename=%s' % FileName
    return response