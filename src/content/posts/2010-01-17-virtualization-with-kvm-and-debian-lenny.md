---
title: Virtualization with KVM and Debian Lenny
date: "2010-01-17T14:04:00+00:00"
author: ajgarlag
layout: post
header_img:
  url: "assets/img/2010-01-17-virtualization-with-kvm-and-debian-lenny/header.png"
  author: Red Hat, Inc.
  author_url: https://en.wikipedia.org/wiki/Libvirt#/media/File:Libvirt_logo.svg
  darken: 0.5
tags:
  - debian
  - virtualization
  - sysadmin
  - en
redirect_from: /blog/virtualization-with-kvm-and-debian-lenny/
comment_posts:
  - author: Antonio J. García Lagar
    date: "2010-01-28T15:58:01+00:00"
    message: |
      <p>After some days searching for a way to install Debian Lenny into the virtual machine with the console interface, I have it. You have to change the --vnc param for the --nographics param, remove the --noautoconsole param and add extra params to the installer kernel with -x "DEBIAN_FRONTEND=text console=ttyS0". This is the whole command:</p><p>virt-install --name=vmguest \<br>--ram 512 \<br>--os-type linux --os-variant debianlenny \<br>--virt-type kvm \<br>--disk path=/opt/vmguest-root.disk,bus=virtio,size=20 \<br>-w network=default,model=virtio \<br>--keymap es \<br>--location <a href="http://ftp.debian.org/debian/dists/lenny/main/installer-amd64" rel="nofollow">http://ftp.debian.org/debian/d...</a><br>-x "DEBIAN_FRONTEND=text console=ttyS0"</p>
  - author: Mike
    date: "2012-09-04T15:25:55+00:00"
    message: |
      <p>And how I am able to connect to the VM for doing installation via console?<br/><br/>Cheers,<br/>Mike</p>
  - author: Antonio J. García Lagar
    date: "2012-09-05T12:49:50+00:00"
    message: |
      <p>You should run:<br/><br/>"virsh console vmguestname"</p>

---
Some weeks ago I've started to work with virtualized machines, and as an old Linux user, I've choosen <a href="http://www.linux-kvm.org" target="_blank">KVM</a> as virtualization infrastructure. KVM is part of the Linux kernel since the 2.6.20 version and <a href="http://www.debian.org" target="_blank">Debian</a> <a href="www.debian.org/releases/lenny/" target="_blank">Lenny 5.0</a> was released with the 2.6.26 kernel version. But in order to work with KVM we need a CPU processor with virtualization support, so the first step is to check if our CPU has it. You have to execute:

```bash
egrep '(vmx|svm)' --color=always /proc/cpuinfo
```

Now you should see a colored flag for each processor core. If you see it, you can go ahead with the following steps.

Although we don't need any extra repository, I've decide to use the <a href="http://www.backports.org" target="_blank"><a target="_blank" rel="nofollow" href="http://backports.org" >backports.org</a></a> semi-official repository to take advantage of the more recent software releases. To enable it, type the following commands:

```bash
echo "deb http://www.backports.org/debian lenny-backports main contrib non-free" \
> /etc/apt/sources.list.d/backports.list && \
wget -O - http://backports.org/debian/archive.key | apt-key add - && \
aptitude update
```

Now, we have to install the required packages:

```bash
aptitude install -t lenny-backports kvm virtinst libvirt-bin
```


Finally we must prepare the network to allow the virtual machine to connect with the world. The Debian <a href="http://packages.debian.org/lenny/libvirt-bin" target="_blank">libvirt-bin</a> package comes with a preconfigured private network (192.168.122.0/24) with a DHCP server managed with <a href="http://packages.debian.org/lenny/dnsmasq" target="_blank">dnsmasq</a>. This network is called _default_ and if we need some virtual machine to start automatically after the host reboot, we have to start this network automatically too. We can do it with **_virsh_**, a Swiss knife command to manage our virtual machines with the help of <a href="http://libvirt.org" target="_blank"><strong><em>libvirt</em></strong></a>.

<pre>virsh net-start default && virsh net-autostart default</pre>

Ok, we're ready to install our new virtual machine with the help of the **_virt-inst_** command. We will install a virtual machine named _vmguest_, with _512Mb_ or ram, running _linux_ (_Debian Lenny_) using _kvm_ as virtualization infrastructure. The disk will be allocated onto the host filesystem in a raw disk image (_/opt/vmguest-root.disk_) with a size of _20G_ and using _virtio_ as the block device driver. The virtual machine will be connected to the _default_ network with a _virtio_ network card. The virtual machine will start a _VNC_ server to allow you to connect to the screen and will disable the connection to the virtual machine serial console. Finally the default keymap will be _es_ and the installer will be downloaded from an external _location_ instead of using a cdrom image.

```bash
virt-install --name=vmguest \
--ram 512 \
--os-type linux --os-variant debianlenny \
--virt-type kvm \
--disk path=/opt/vmguest-root.disk,bus=virtio,size=20 \
-w network=default,model=virtio \
--vnc \
--noautoconsole \
--keymap es \
--location http://ftp.debian.org/debian/dists/lenny/main/installer-amd64
```

Now we have to connect to the virtual machine session in order to complete the installation. To do it I usually use **_virt-viewer_** through an ssh tunnel to connect to the host machine (remember to install it if you need it). To do it type:

```bash
virt-viewer -c qemu+ssh://root@host.machine/system vmguest
```

If you are directly connected to the host machine, you have to type as root:

<pre>virt-viewer -c qemu:///system vmguest</pre>

Ok, that's all. You ready to install your new Debian Lenny onto the virtual machine. Once installed, the virtual machines will be managed with the **_virsh_** command&#8230; but it will be on another host.

**Edited:** For this first post about KVM I think it's a better idea to save the disk onto the host filesystem, although I prefer LVM, because the file based disk image does not need any previous setup.

**Edited 2:** This post was written when the libvirt backport version was 0.6.5-3. I you have any problem with the latest backport packages you can download the old ones from <a href="http://snapshot.debian.org/package/libvirt/0.6.5-3~bpo50%2B1/" target="_blank"><a target="_blank" rel="nofollow" href="http://snapshot.debian.org/package/libvirt/0.6.5-3~bpo50%2B1/" >snapshot.debian.org/package/libvirt/0.6.5-3~bpo50%2B1/</a></a>
