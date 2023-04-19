<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#usage">Usage</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```
* node v16.9.x or above
    ```sh
    npm install node@latest
    ```
    To make sure you have the correct version of node type:
    ```sh
    node -v #should be v.16.18.0 or above
    ```

### Installation

1. Clone the repo
    ```sh
    git clone https://github.com/RotesBlatt/disco-salad.git
    cd disco-salad
    ```
2. Install NPM packages
    ```sh
    npm install
    ```
3. Create a `.env` file with these variables
    ```env
    BOT_TOKEN=YOUR_DISCORD_BOT_PRIVATE_TOKEN
    CLIENT_ID=YOUR_DISCORD_BOT_CLIENT_TOKEN
    ```
4. Run the command deploy file
    ```sh
    npx ts-node .\src\deploy-commands.ts
    ```
5. Start the discord bot
    ```sh
    npx ts-node .\src\index.ts
    ```
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- Usage -->
## Usage

First, invite the bot to your server by going to the [Discord Developer Portal](https://discord.com/developers/applications) and selecting your application (bot). Then on the left, go to the tab "OAuth2" and select "URL Generator". On the right side select the "bot" scope and give it the "Administrator" permissions. Now you'll see a generated URL which you can copy into a new tab and invite the bot to a server where you have administrator privileges.

After inviting the bot to the server, you can start the party! Just get into a voice channel and type your first command into any text channel!

* /play search: https://www.youtube.com/watch?v=dQw4w9WgXcQ

  Soon after entering the command, you'll notice the bot joining your channel and start playing the music. You can also enter a spotify track link or just search for keywords by replacing the link with something like this: "marc rebillet edeka"

* /skip

  Skips the currently playing song and starts playing the next one in the queue. The optional parameter "to" can skip to a specific position in the queue

* /loop

  Repeat the currently playing song until you're bored of hearing that song, then use the command again to stop the looping

* /np

  Shows you the currently playing song with some extra information about the song

* /queue

  Shows you the current song queue as well as the currently playing song 

* /stop

  Stops the bot from playing the music and clears it's entire song queue. If you want the bot to leave as well, then type "/leave" to get the same result be he also leaves your voice channel

There are more features which you can see by typing / in a text-channel. Then clicking on the little icon from the bot enables you to scroll through the list of commands which exist on the bot.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Roadmap -->
## Roadmap
- [x] Basic functionality
    - [x] Playing songs from a YT-link
    - [x] Song queue for the music 
    - [x] Pausing and resuming the music
    - [x] Skipping the current playing song
    - [x] Stopping the currently playing song and clearing the song queue
- [x] Expanding the basics
    - [x] Search for song by searching for the given title (ytsr)
    - [x] Enqueue songs by YT-link to playlist (ytpl)
    - [x] Current song looping
    - [x] Song queue looping
    - [x] Show the current playing song to the user
    - [x] Show the song queue to the user
    - [x] Remove songs at specific index from the queue
    - [x] Skip to specific song position in queue
- [ ] Create server settings
  - [ ] Listen to only one text-channel for commands
  - [ ] Join only one specific channel
  - [ ] Restrict bot from changing channel when doing (/join)
  - [ ] Only users with certain permissions can use the bot
  - [ ] Should show current playing song whenever it starts playing
  - [ ] How many songs should be retrieved from a playlist when linking a playlist
  - [ ] Play a url before leaving the voicechannel because of inactivity 
- [x] Use embeds for user interaction
- [x] Spotify streaming option (kinda)
- [ ] Use logger for logging information to the console
- [ ] Track stats
    - [ ] Amount of times a song has been played
    - [ ] Most played artist
    - [ ] Who requested the song
- [ ] Ask chatgpt for a song suggestion by giving it a topic/theme
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Acknowledgements -->
## Acknowledgements
Thanks to Smn279#4383 for the idea of the skipping to command
<p align="right">(<a href="#readme-top">back to top</a>)</p>