export function setKeyOrder(alert, order) {
	for (var i = 0; i < order.length; i++) {
		var thisItem = order[i],
			nextItem = order[i + 1];

		if (nextItem) thisItem.setNextKeyView(nextItem);
	}

	alert.window().setInitialFirstResponder(order[0]);
}


/**
 * Create a label with bold style
 * @param {string} text 
 * @param {number} size 
 * @param {object} frame 
 */
export function createBoldLabel(text, size, frame) {
	var label = NSTextField.alloc().initWithFrame(frame);

	label.setStringValue(text);
	label.setFont(NSFont.boldSystemFontOfSize(size));
	label.setBezeled(false);
	label.setDrawsBackground(false);
	label.setEditable(false);
	label.setSelectable(false);

	return label;
}


/**
 * Create a text field
 * @param {string} value 
 * @param {object} frame 
 */
export function createField(value, frame) {
	var field = NSTextField.alloc().initWithFrame(frame);

	field.setStringValue(value);

	return field;
}


/**
 * Create a select field
 * @param {array} items 
 * @param {number} selectedItemIndex 
 * @param {object} frame 
 */
export function createSelect(items, selectedItemIndex, frame) {
	const comboBox = NSComboBox.alloc().initWithFrame(frame),
		selectedItemIndex2 = (selectedItemIndex > -1) ? selectedItemIndex : 0;

	comboBox.addItemsWithObjectValues(items);
	comboBox.selectItemAtIndex(selectedItemIndex2);
	comboBox.setNumberOfVisibleItems(16);
	comboBox.setCompletes(1);

	return comboBox;
}