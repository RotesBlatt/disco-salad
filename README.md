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
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
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


<!-- Roadmap -->
## Roadmap
- [x] Basic functionality
    - [x] Playing songs from a YT-link
    - [x] Song queue for the music 
    - [x] Pausing and resuming the music
    - [x] Skipping the current playing song
    - [ ] Stopping playing the current song queue
- [ ] Expanding the basics
    - [ ] Search for song by searching for the given title (ytsr)
    - [ ] Enqueue songs by YT-link to playlist (ytpl)
    - [x] Current song looping
    - [ ] Current song queue looping
    - [ ] Show the current playing song to the user
        - [ ] Title of the song
        - [ ] Timestamp of where we are in the song
    - [ ] Show the song queue to the user
- [ ] Create server settings
  - [ ] Listen to only one text-channel for commands
  - [ ] Join only one specific channel
  - [ ] Restrict bot from changing channel when doing (/join)
  - [ ] Only users with certain permissions can use the bot
- [ ] Use embeds for user interaction
- [ ] Use logger for logging information to the console
- [ ] Track stats
    - [ ] Amount of times a song has been played
    - [ ] Who requested the song
<p align="right">(<a href="#readme-top">back to top</a>)</p>