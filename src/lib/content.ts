import type { JourneyContent } from './types';

export const journeyContent: JourneyContent = {
	hero: {
		eyebrow: 'En særlig dag nærmer sig',
		scrollHint: 'Scroll for at fortsætte',
		letter: {
			content: `Kære alle der er inviteret til min konfirmation,

Du er blevet inviteret til min konfirmation og jeg håber virkelig at du vil komme. Der bliver masser af lækker mad og god stemning, med taler og quizzer om mig. Længere nede i hjemmesiden kan I se dato og, hvor I kan tilmelde jer og endda eventuelt skrive et brev til mig, hvis I vil.

Jeg glæder mig virkelig til at se jer alle.`,
			signature: 'Knus, Hjalte'
		}
	},
	journey: {
		phases: [
			{ id: 'childhood', title: 'Barndom' },
			{ id: 'growing', title: 'Opvækst' },
			{ id: 'today', title: 'I dag' }
		]
	},
	invitation: {
		eyebrow: '',
		title: 'Invitation',
		transitionLine: '',
		confirmandName: 'Hjalte',
		when: {
			dateLabel: 'Torsdag d. 14. maj 2026',
			timeLabel: 'kl. 11:30',
			startISO: '2026-05-14T11:30:00+02:00',
			endISO: '2026-05-14T17:30:00+02:00'
		},
		where: {
			venueName: 'Ølstedgaard Festlokaler',
			addressLines: ['Nederholmsvej 12, 8723 Løsning']
		},
		dressCode: '',
		buttons: {
			addToCalendar: 'Tilføj til kalender'
		}
	},
	rsvp: {
		enabled: true,
		title: 'Tilmelding',
		fields: {
			whoIsComingLabel: 'Hvem deltager?',
			messageLabel: 'Besked til konfirmanden (valgfrit)'
		},
		submitLabel: 'Send tilmelding',
		submittingLabel: 'Sender…',
		successTitle: 'Tilmelding modtaget',
		successMessage: 'Tak — jeres svar er blevet registreret.'
	},
	wishlist: {
		enabled: true,
		title: 'Ønskeseddel',
		description: 'Her er nogle idéer til gaver',
		categories: [
			{
				id: 'tech',
				title: 'Teknologi',
				items: ['Høretelefoner', 'Spil til PS5', 'Bluetooth højttaler']
			},
			{
				id: 'experiences',
				title: 'Oplevelser',
				items: ['Biograf gavekort', 'Koncertbilletter']
			},
			{
				id: 'other',
				title: 'Andet',
				items: ['Tøj', 'Bøger', 'Penge til kørekort']
			}
		]
	}
};
