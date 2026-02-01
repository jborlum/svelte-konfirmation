export interface Invitee {
	id: string;
	name: string;
}

export interface InviteGroup {
	code: string;
	invitees: Invitee[];
	groupName?: string;
}

export type JourneyPhase = {
	id: 'childhood' | 'growing' | 'today';
	title: string;
};

export type JourneyContent = {
	hero: {
		eyebrow: string;
		scrollHint: string;
		letter?: {
			content: string;
			signature: string;
		};
	};
	journey: {
		phases: JourneyPhase[];
	};
	invitation: {
		eyebrow: string;
		title: string;
		transitionLine: string;
		confirmandName: string;
		when: {
			dateLabel: string;
			timeLabel: string;
			startISO: string;
			endISO: string;
		};
		where: {
			venueName: string;
			addressLines: string[];
		};
		dressCode?: string;
		buttons: {
			addToCalendar: string;
		};
	};
	rsvp?: {
		enabled: boolean;
		title: string;
		fields: {
			whoIsComingLabel: string;
			messageLabel: string;
		};
		submitLabel: string;
		submittingLabel: string;
		successTitle: string;
		successMessage: string;
	};
	wishlist?: {
		enabled: boolean;
		title: string;
		description?: string;
		categories: {
			id: string;
			title: string;
			items: string[];
		}[];
	};
};
