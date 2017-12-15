import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const GroceryItems = new Mongo.Collection('groceryItems');

if (Meteor.isServer) {
	// This code only runs on the server
	// Only publish tasks that are public or belong to the current user
	Meteor.publish('groceryItems', () => {
		return GroceryItems.find({
			$or: [
				{ private: { $ne: true } },
				{ owner: this.userId },
			],
		});
	});
}
  
Meteor.methods({
	'groceryItems.insert'(text) {
		check(text, String);

		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}

		GroceryItems.insert({
			text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username,
		});
	},
	'groceryItems.remove'(groceryItemId) {
		check(groceryItemId, String);

		const task = GroceryItems.findOne(groceryItemId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can delete it
			throw new Meteor.Error('not-authorized');
		}

		GroceryItems.remove(groceryItemId);
	},
	'groceryItems.setChecked'(groceryItemId, setChecked) {
		check(groceryItemId, String);
		check(setChecked, Boolean);

		const task = GroceryItems.findOne(groceryItemId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can check it off
			throw new Meteor.Error('not-authorized');
		}

		GroceryItems.update(groceryItemId, { $set: { checked: setChecked } });
	}
});