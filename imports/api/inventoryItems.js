import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const InventoryItems = new Mongo.Collection('inventoryItems');

if (Meteor.isServer) {
	// This code only runs on the server
	// Only publish tasks that are public or belong to the current user
	Meteor.publish('inventoryItems', () => {
		return InventoryItems.find({
			$or: [
				{ private: { $ne: true } },
				{ owner: this.userId },
			],
		});
	});
}
  
Meteor.methods({
	'inventoryItems.insert'(text) {
		check(text, String);

		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}

		InventoryItems.insert({
			text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username,
		});
	},
	'inventoryItems.remove'(inventoryItemId) {
		check(inventoryItemId, String);

		const task = InventoryItems.findOne(inventoryItemId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can delete it
			throw new Meteor.Error('not-authorized');
		}

		InventoryItems.remove(inventoryItemId);
	},
	'inventoryItems.setChecked'(inventoryItemId, setChecked) {
		check(inventoryItemId, String);
		check(setChecked, Boolean);

		const task = InventoryItems.findOne(inventoryItemId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can check it off
			throw new Meteor.Error('not-authorized');
		}

		InventoryItems.update(inventoryItemId, { $set: { checked: setChecked } });
	}
});