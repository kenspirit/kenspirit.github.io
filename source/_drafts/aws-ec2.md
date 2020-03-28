title: aws ec2
tags:
---


## Basics

Instance vs AMI (Amazon Machine Image)

AMI 是一个模板，包含了软件配置（系统，应用等）。可根据 AMI 来启动多个不同的虚拟服务器（instance）。

Intance 就是云上的虚拟服务器。有具体的硬件配置，CPU，内存等。

AMI 必须和 instance 在同一个 region。

When instance terminated, root device volume is deleted by default.  Attached EBS is preserved by default, determined by deleteOnTermination setting.

Instances with instance-store devices are always terminated as the result of an instance shutdown.

Each account's availability zone with same name might not be the same as another account.  AZ ID is the same.

Key pair to login EC2 is per region.  Must chagne it to read only (chmod 400 xxxx.pem) before connecting to linux instance.

## AMI

An AMI includes:
1. One or more EBS snapshots, or a template for the root volume of the instance for instance-store-backed AMI
2. Launch permissions (public/explict/implicit)
3. A block device mapping that specifies the volumes

AMI has following characteristics:
1. Region
2. OS
3. Architecture (32 or 64 bit)
4. Launch Permissions
5. Storage for Root Device

Customize an instance stored-backed AMI and create a new one, full size of it is stored in S3.
Cusotmize an EBS-backed AMI and create a new one, only the changes are stored.

Two types of Virtualizaiton
* Paravirtual (PV)
* Hardware virtual machine (HVM)

Differences are the way in which they boot and whether they can take advantage of special hardware extensions (CPU, network and storage).

Unlike PV guests, HVM guests can take advantage of hardware extensions that provide fast access to the underlying hardware on the host system.

## Instances

### Instance Types

EC2 dedicates resources of host computer to instances.  If each instance tries to use as much as possible, each receives an equal share.  If resource is underused, an instance can consume a higher share when available.

Available Instance Types
* General purpose
  A1 - Arm-based workloads: Scale-out workloads such as web servers
  M5 - General Purpose: Application Servers
  T3 - Lowest Cost, General Purpose: Web Servers/Small DBs

* Compute optimized
  C5 - Compute Optimized: CPU Intensive Apps/DBs

* Memory optimized
  R5 - Memory Optimized: Memory Intensive Apps/DBs etc
  X1 - Memory Optimized: SAP HANA/Apache Spark etc
  Z1D - High compute capacity and high memory footprint: EDA and certain RDBMS workloads with high per-core licensing
  U-6tb1 - Bare Metal: Eliminate virtualization overhead

* Storage optimized
  I3 - High Speed Storage: NoSQL DB, Data Warehousing
  D2 - Dense Storage: Fileservers/Data Warehousing/Hadoop
  H1 - High Disk Throughput: MapReduced-based workloads, distributed file systems(e.g. HDFS and MapR-FS)

* Accelerated computing
  F1 - Field Programmable Gate Array: Genomics research, financial analytics, realtime video processing, big data
  G3 - Graphics Intensive: Video Encoding/ 3D Application Streaming
  P3 - Graphics/General Purpose GPU: Machine Learning, Bit Coin Mining

## Networking and Security



## Storage



## Load Balancing




## CloudFormation



## Elastic Beanstalk


