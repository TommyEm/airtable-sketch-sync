# Airtable-Sketch Sync

This plugin populates Sketch artboards with content from an Airtable base. It supports rich text for regular layers.

## Installation

- Download the latest release.
- Double-click the `.sketchplugin` file to install.

## Airtable

To work properly, content should be structured as follows:
- One base per project or Sketch page (recommended).
- One table per artboard, with matching names.
- The first Airtable field (column) should be set to `Name`.
- Each entry in the `Name` field should be the name of a layer. Some layers can have the same name (for example: a `Title` in the header, and the `Title` of the main section). To target specific layers, your can specify some parent layers before with `/` as separator (examples: `Header / Title`, or `Header / Navigation / Item 1`). No need to specify the complete hierarchy, just a minimum of groups or symbol names should be sufficient.
- If you use emojis to organize Sketch layers, they're OK, they will just be ignored when comparing with Airtable records.
- Fields subsequent to `Name` is where the data to be synced must go. Multiple columns can be used for internationalization. Their names are to be specified in the settings window (defaults are: `['en_US','en_UK','fr_FR']`). It is recommended to set these fields to `Long text`, other types are not supported.

## Usage

### Settings

Go to `Plugins > Airtable-Sketch Sync > Settings`.

1. Insert your Airtable API Key.
2. Insert your bases keys in JSON format.
3. Specify the names of your data fields (languages).

### Sync a selection of artboards

- Select one or more artboards.
- Go to `Plugins > Airtable-Sketch Sync > Sync Selected Artboards` (shortcut `Shift Command D`).

### Sync all artboards on the page

Go to `Plugins > Airtable-Sketch Sync > Sync All Artboards`.

### Sync options

- Base: the base corresponding to the current project.
- Language: the field (column) corresponding to the data wanted.
- View: currently not used.
- Max records: if you want to limit the number of records to be synced per table. Specify a high number by default if you want to be sure to sync everything all the time.
- Underline color: when using links in Airtable (rich text enabled), you can specify here their color here.
- Common data: if you need data shared across multiple artboards (for example, for headers and footers), you can set it up in a separate table. Just indicate its name here.
