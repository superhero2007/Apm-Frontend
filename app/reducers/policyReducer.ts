const UPDATE_CURRENT_PROFILE_NAME = "UPDATE_CURRENT_PROFILE_NAME";

export function action_updateCurrentProfileName(name:string)
{
	return {
		type: UPDATE_CURRENT_PROFILE_NAME,
		name
	};
}

export function policyDetailReducer(state={}, action)
{
	switch (action.type)
	{
		case UPDATE_CURRENT_PROFILE_NAME:
		{
			return Object.assign({}, state, {policyName: action.name});
		}
		default:
			return state;
	}

}