# HCS - Hytale Control Suite

I created this "mod" out of necessity: 
when I wasn't physically present at the PC for work and my friends wanted to play on the server we built, 
I just had to start the PC and the controller. This way they could start and manage the mods themselves. 
Then I thought: what if the PC is left on all night? That's how the controller was born, with various scripts to manage server mods, and even start and stop the PC.

HCS is a server managemens that combines a Node.js controller,
a web dashboard and a Discord bot into a single control system.

## Features

- Server start / stop / restart
- Web dashboard monitoring (CPU, RAM, uptime)
- Discord bot integration
- Mod manager (install, uninstall, restore, delete)
- Runtime logging system
- Scheduled shutdown system
- Install and configuration wizard
- Remote dashboard access (Local / LAN / DDNS)

## Project Structure

- core/ -> Server control and mod management logic
- services/ -> Discord bot and Web API
- utils/ -> Logger, config loader, path manager
- web/ -> Dashboard main page
- scripts/ -> Install, configure, start, stop scripts
- runtime/ -> Logs files

## Quick Installation with wizard

1. Run scripts/install.bat
2. Run scripts/configure.bat
3. Run scripts/start.bat
4. Open dashboard in your browser

## Discord Commands in libked bot text channel

!start
!stop
!restart
!webmod
!shut
!abort

## Release

Current version: v1.1.0
Available on CurseForge.
