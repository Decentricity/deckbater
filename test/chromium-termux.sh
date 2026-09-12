#!/data/data/com.termux/files/usr/bin/sh
# Optional phone-only browser adapter. Direct PRoot avoids a second supervisor.
unset LD_PRELOAD
exec /data/data/com.termux/files/usr/bin/proot -0 \
  -r /data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/debian \
  -b /dev -b /proc -b /sys -b /data -b /storage -b /data/data/com.termux/files/usr/tmp:/tmp \
  -w /tmp /usr/lib/chromium/chromium "$@"
