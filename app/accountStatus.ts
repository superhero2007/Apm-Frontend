import {UserRole} from "./roles";

export class AccountStatus
{
    isPro       :boolean;
    isAdmin     :boolean;
    isApmUser   :boolean;
    isDemoUser  :boolean;
    invalidCard :boolean;
    role        :UserRole;
	billingIssue: boolean;

    public static read(accStatusData:any)
    {
        accountStatus.isPro = accStatusData.isPro;
        accountStatus.isAdmin = accStatusData.isAdmin;
        accountStatus.isApmUser = accStatusData.isApmUser;
        accountStatus.isDemoUser = accStatusData.isDemoUser;
        accountStatus.invalidCard = accStatusData.invalidCard;
        accountStatus.role = UserRole[accStatusData.role as string];
	    accountStatus.billingIssue = accStatusData.billingIssue;
    }

    hasBillingIssue()
    {
        return this.billingIssue;
    }
}


export const accountStatus = new AccountStatus();
