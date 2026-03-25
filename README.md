# HCS - Hytale Control Suite

Why HCS was born:

I created this suite out of necessity. As a lighting technician often away for work, my friends couldn't access our server unless I was physically at my PC. I needed a way for them to manage mods and server states independently.

​Then I realized: leaving a PC running 24/7 isn't ideal. That’s how the HCS Controller evolved—integrating smart scripts to monitor resources, manage mods, and handle remote startup/shutdown to protect the hardware and save energy.

So this project started as a personal tool, but I decided to clean it up and release it publicly 
in case it can be useful for other Hytale server owners.


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

## Discord Commands in linked bot text channel

!start
!stop
!restart
!webmod
!shut
!abort

## Bugs

I'm still improving the project, so if you have any feedback, suggestions and ideas please let me know.

## Release

Current version: v1.1.0
Available on CurseForge.
