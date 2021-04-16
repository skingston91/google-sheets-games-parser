# Localiser 'fixer'

Originally Quick fix solutions to our localize problems (originally it was just doing re-key mapping but last minute added in new index for generating all games)

indexLocalizeFixer will try to convert our existing localize keys from just using values to using a key value generated from the game id. This is to keep the existing value based translations into game id value

### For localize fixer: as it was meant to be one and done

To run: yarn localizeFixer

Note that it will run it all into one file so you need to edit the code to set elevator pitches only etc

Chinese content should be in

content.zh-Hans.csv
game_title.zh-Hans.csv

Drupal is automatally downloaded

## Obvious improvements:

- Add tests
- Add Typescript
