// button for Entry requests
exports.entry_request_button = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_entry_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'forward_entry_request_toGM',
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
			callback_data: 'entred_successfuly',
		},
	],
]

// Exit request buttons
exports.exit_request_button = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_exit_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'forward_exit_request_toGM',
		},
	],
]

exports.exit_request_button_to_GM = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_exit_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'approve_exit_request',
		},
	],
]
exports.security_exit_button = [
	[
		{
			text: 'Exit',
			callback_data: 'exited_successfuly',
		},
	],
]
