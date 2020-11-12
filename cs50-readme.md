# AirSketch

This is a plugin for [Sketch](https://www.sketch.com/). It populates Sketch artboards with content from an [Airtable](https://airtable.com/) base. It supports internationalization and rich text for standard text layers (not for symbol overrides though).

## Installation

- Double-click the `.sketchplugin` file to install. Sketch must be installed first.

## Airtable

To work properly, content in Airtable should be structured as follows:
- One base per project or Sketch page (recommended).
- One table per artboard, with matching names.
- The first Airtable field (column) should be set to `Name`.
- Each entry in the `Name` field should be the name of a layer. Some layers can have the same name (for example: a `Title` in the header, and the `Title` of the main section). To target specific layers, your can specify some parent layers before with `/` as separator (examples: `Header / Title`, or `Header / Navigation / Item 1`). No need to specify the complete hierarchy, just a minimum of groups or symbol names should be sufficient.
- If you use emojis to organize your Sketch layers, it's OK, but they just will be ignored when comparing with Airtable names.
- Fields subsequent to `Name` are where the data to be synced must go. Multiple columns can be used for internationalization. Their names are to be specified in the settings window in Sketch(defaults are: `['en_US','en_UK','fr_FR']`). It is recommended to set these fields to `Long text`, other types are not officially supported.
- To enrich text in Airtable, just toggle the `Enable rich text formatting` switch in the column settings (double-click on the column header).

## Usage

### Settings

Go to `Plugins > AirSketch > Settings`.

1. Insert your Airtable API Key.
2. Insert your bases keys in JSON format.
3. Specify the names of your data fields (languages).

### Sync a selection of artboards

- Select one or more artboards.
- Go to `Plugins > AirSketch > Sync Selected Artboards` (shortcut `Shift Command D`).

### Sync all artboards on the page

Go to `Plugins > AirSketch > Sync All Artboards`.

### Sync options

- Base: the Airtable base corresponding to the current project.
- Language: the field (column) corresponding to the data wanted.
- View: the view used in Airtable. Currently only the Grid View is supported.
- Max records: The limit of records to be synced per table. Specify a high number by default if you want to be sure to sync everything all the time.
- Underline color: when using links in Airtable (rich text enabled), you can specify here the color of the text to be rendered here.
- Common data: if you need data shared across multiple artboards (for example, for headers and footers), you can set it up in a separate table. Just indicate its name here.
