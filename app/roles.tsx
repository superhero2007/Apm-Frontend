import {accountStatus} from "./accountStatus";
export enum UserRole
{
	ADMIN,
	NORMAL,
	READONLY
}


export enum Permission
{
	APP_EDIT,
	TAG_EDIT,
	ALERT_POLICY_EDIT,
	INTEGRATION_EDIT,
	TXN_UNPIN
}


export class PermissionManager
{
	private static permissionsToRoles()
	{
		const perms = {};
		perms[Permission.APP_EDIT] = [UserRole.ADMIN, UserRole.NORMAL];
		perms[Permission.TAG_EDIT] = [UserRole.ADMIN, UserRole.NORMAL];
		perms[Permission.ALERT_POLICY_EDIT] = [UserRole.ADMIN, UserRole.NORMAL];
		perms[Permission.INTEGRATION_EDIT] = [UserRole.ADMIN, UserRole.NORMAL];
		perms[Permission.TXN_UNPIN] = [UserRole.ADMIN, UserRole.NORMAL];
		return perms;
	}

	private static perms = PermissionManager.permissionsToRoles();

	private static hasPermission(role: UserRole, permission: Permission):boolean
	{
		var roles = this.perms[permission];
		return roles.includes(role);
	}

	static permissionAvailable(permission: Permission)
	{
		return this.hasPermission(accountStatus.role, permission);
	}
}