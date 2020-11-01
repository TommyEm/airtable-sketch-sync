# Airtable-Sketch Sync

This plugin populates Sketch artboards with content from an Airtable base. It supports rich text for regular layers, but in overrides.

## Installation

- Download the latest release.
- Double-click the `.sketchplugin` file to install.

## Airtable

To work properly, content should be structured as follows:
- One base per project or page.
- One table per artboard.
- The first field (column) must be named `Name`, each entry being the name of a layer.
- Layer names in Sketch can use emojis even if they're not in Airtable.
- To target specific layers, your can use parent layer names with `/` as separator (examples: `Header / Title`, or `Header / Navigation / Item 1`).
- The second field is meant for the content values. Subsequent fields can be used for translation in different languages (internationalization).

## Usage

### Settings

Go to `Plugins > Airtable-Sketch Sync > Settings`.
Insert your Airtable API Key.
Insert your bases keys in JSON format.

```
{
	"baseName1": "Base Key",
	"baseName2": "Base Key"
}
```

### Sync a selection of artboards

Select one or more artboards.
Go to `Plugins > Airtable-Sketch Sync > Sync Selected Artboards` (shortcut `Shift Command D`).

### Sync all artboards on the page

Go to `Plugins > Airtable-Sketch Sync > Sync All Artboards`.

### Sync options

- Base: the base corresponding to the current project.
- Language: the field (column) corresponding to the language to be synced with.
- View: currently not used.
- Max records: if you want to limit the number of records to be synced per table. Specify a high number by default if you want to be sure to sync everything all the time.
- Underline color: when using inserting links in Airtable, you can specify here their color.
