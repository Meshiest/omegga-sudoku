# sudoku plugin

A playable sudoku generator plugin for [omegga](https://github.com/brickadia-community/omegga).

To play, duplicate the numbers on the right to the board. Feel free to remove the numbers when you've used 9 or recolor them.

## Install

Easy: `omegga install gh:Meshiest/sudoku`

Manual:

* `git clone https://github.com/meshiest/omegga-sudoku sudoku` in `plugins` directory
* `npm i` in `sudoku` directory

## Screenshot

![](https://i.imgur.com/OZWqtET.png)

## Commands

* `!sudoku medium` - generate a sudoku below your player

## Configs

* `host-only` - make sudoku generation limited to host and authorized users
* `authorized` - comma separated list of usernames that are allowed to generate sudokus

