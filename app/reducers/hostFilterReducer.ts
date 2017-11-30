export interface IRR_Filter_Host {
	selectedHostIds: string[];
}

const UPDATE_SELECTED_HOSTS = "UPDATE_SELECTED_HOSTS";


export function action_updateSelectedHosts(hostIds: string[])
{
	return {
		type: UPDATE_SELECTED_HOSTS,
		hostIds
	};
}

export function hostFilterReducer(state ={}, action)
{
	switch (action.type)
	{
		case UPDATE_SELECTED_HOSTS:
		{
			return {...state, selectedHostIds: action.hostIds}
		}

		default:
			return state;
	}
}