export enum SvrTab
{
	List,
	Compute,
	Network,
	Disk,
	Process
}

export enum ServerProcSortType {
    Cpu,
	Mem,
	ThreadCount,
	InstanceCount,
	FDLimit,
	FDUsed,
	DiskRead,
	DiskWrite
}
export interface IHostId
{
	fullName: string;
	name: string;
	id: string;
	label: string; //added by us in frontend
}


export interface IRR_ServerPage
{
	tab: SvrTab;
	hosts: IHostId[];
	selectedEntity: string;
	procSortType: ServerProcSortType;
}

const UPDATE_SERVER_PAGE_TAB = "UPDATE_SERVER_PAGE_TAB";
const UPDATE_SERVER_HOST_LIST = "UPDATE_SERVER_HOST_LIST";
const UPDATE_SERVER_SELECTED_ENTITY = "UPDATE_SERVER_SELECTED_ENTITY";
const UPDATE_SERVER_PROC_SORT_TYPE = "UPDATE_SERVER_PROC_SORT_TYPE";


export function action_updateServerProcSortType(procSortType: ServerProcSortType)
{
	return {
		type: UPDATE_SERVER_PROC_SORT_TYPE,
		procSortType
	};
}


export function action_updateServerPageTab(tab: SvrTab)
{
	return {
		type: UPDATE_SERVER_PAGE_TAB,
		tab
	};
}

export function action_updateServerHostList(hosts: IHostId[])
{
	return {
		type: UPDATE_SERVER_HOST_LIST,
		hosts
	};
}

export function action_updateServerSelectedEntity(entity: string)
{
	return {
		type: UPDATE_SERVER_SELECTED_ENTITY,
		entity
	}
}


export function serverPageReducer(state={}, action)
{
	switch (action.type)
	{
		case UPDATE_SERVER_PAGE_TAB:
		{
			return {...state, tab: action.tab};
		}
		case UPDATE_SERVER_HOST_LIST:
		{
			return {...state, hosts: action.hosts};
		}
		case UPDATE_SERVER_SELECTED_ENTITY:
		{
			return {...state, selectedEntity: action.entity}
		}

		case UPDATE_SERVER_PROC_SORT_TYPE:
		{
			return {...state, procSortType: action.procSortType}
		}

		default:
			return state;
	}
}