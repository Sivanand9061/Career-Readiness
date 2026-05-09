
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
  }
"@
$hwnd = [Win32]::GetForegroundWindow()
if ($hwnd -eq 0) { exit }
$pid = 0
[Win32]::GetWindowThreadProcessId($hwnd, [ref]$pid)
$process = Get-Process -Id $pid -ErrorAction SilentlyContinue
if ($process) { Write-Output $process.ProcessName }
