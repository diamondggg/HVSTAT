HVSTAT NOTES
================

Use
---
Firefox: Drag and drop the .xpi into Firefox, "install."
Opera: Drag and drop the [chrome].crx into Opera, and click "install," "enable."
Chrome: Switch to Linux or a different browser/fork.

General programming remarks
---------------------------
Always use easy to understand variable names.
Always put var in front of a newly declared variable, to avoid scope issues.

Optimization Hints
------------------
Try to put all variable declarations at the start of the function (not strictly required).
Don't use regex if possible. It can be extremely slow.
jQuery and jQuery UI must not be used except on the dialog panel for performance reason.

Version Locations
-----------------
package.json - Firefox Manifest
data/manifest.json - Chrome/Opera Manifest
data/hvstat.user.js - Ln 69 (First line of 'var hvStat')

Release Info
------------
- For Opera/Chrome, name the crx "HVS\_chrome\_[VERSION].crx"
- For Firefox, name zipped package "HVS\_firefox\_[VERSION].xpi"
