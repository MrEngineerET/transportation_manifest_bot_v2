exports.entry_request_button = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_entry_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'forward_request_toGM',
		},
	],
]

exports.entry_request_button_to_GM = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_entry_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'approve_entry_request',
		},
	],
]
exports.security_enter_button = [
	[
		{
			text: 'Enter',
			callback_data: 'entered_success',
		},
	],
]
