// for page navigation & to sort on leftbar

export type EachRoute = {
	title: string;
	href: string;
	noLink?: true;
	items?: EachRoute[];
};

export const ROUTES: EachRoute[] = [
	{
		title: "Welcome",
		href: "",
		noLink: true,
		items: [
			{ title: "Introduction", href: "/introduction" },
			{ title: "Quickstart", href: "/quickstart" },
			{ title: "Samples", href: "/samples" },
		],
	},

	{
		title: "Using Zero",
		href: "",
		noLink: true,
		items: [
			//TODO
			//{title: 'How Zero Works', href: '/overview'},
			{ title: "Connecting to Postgres", href: "/connecting-to-postgres" },
			{ title: "Supported Postgres Features", href: "/postgres-support" },
			{ title: "Zero Schema", href: "/zero-schema" },
			{ title: "Reading Data with ZQL", href: "/reading-data" },
			{ title: "Writing Data with Mutators", href: "/writing-data" },
			{ title: "Authentication", href: "/auth" },
			{ title: "Permissions", href: "/permissions" },
			{ title: "Preloading", href: "/preloading" },
			{ title: "Schema Migrations", href: "/migrations" },
			{ title: "Deployment", href: "/deployment" },
			{ title: "`zero-cache` Config", href: "/zero-cache-config" },
			{ title: "Recipes", href: "/recipes" },
		],
	},

	{
		title: "Integrations",
		href: "",
		noLink: true,
		items: [
			{ title: "React", href: "/react" },
			{ title: "Expo", href: "/expo" },
			{ title: "SolidJS", href: "/solidjs" },
			{ title: "Community", href: "/community" },
		],
	},

	{
		title: "Meta",
		href: "",
		noLink: true,
		items: [
			{ title: "Roadmap", href: "/roadmap" },
			{ title: "Reporting Bugs", href: "/reporting-bugs" },
			{ title: "Release Notes", href: "/release-notes" },
			{ title: "Open Source", href: "/open-source" },
		],
	},
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
	const ans: Page[] = [];
	if (!node.noLink) {
		ans.push({ title: node.title, href: node.href });
	}
	node.items?.forEach((subNode) => {
		const temp = { ...subNode, href: `${node.href}${subNode.href}` };
		ans.push(...getRecurrsiveAllLinks(temp));
	});
	return ans;
}

export const page_routes = ROUTES.flatMap((it) => getRecurrsiveAllLinks(it));
