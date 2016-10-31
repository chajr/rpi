#!/bin/bash
top -bn1 | grep -i "%Cpu" | head -1 | sed "s/.*, *\([0-9]*,.\)%* \(id\|be\).*/\1/;s/,/./" | awk '{print 100 -$1}' > /var/log/proc.log