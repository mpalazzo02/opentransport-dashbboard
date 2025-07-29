"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DEMO_ACCOUNTS } from "@/lib/demo-data"
import { saveCurrentAccount } from "@/lib/storage"
import { Train, MapPin, BarChart3, ArrowRight, Leaf, Github, Mail, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
	const router = useRouter()
	const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

	const handleAccountSelect = (accountId: string) => {
		setSelectedAccount(accountId)
		saveCurrentAccount(accountId)
		router.push("/setup")
	}

	const scrollToDemo = () => {
		document.getElementById("demo-section")?.scrollIntoView({
			behavior: "smooth",
		})
	}

	return (
		<div className="min-h-screen">
			{/* Full-Screen Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
				{/* Animated Gradient Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-openTransport-primary/5 via-blue-50 to-openTransport-accent/5">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,98,254,0.1),transparent_50%)]" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(18,183,106,0.1),transparent_50%)]" />
				</div>

				{/* Hero Content */}
				<div className="relative z-10 container mx-auto px-4 text-center">
					{/* Logo */}

					{/* Main Headline */}
					<div className="flex items-center justify-center gap-6 mb-6 animate-fade-in-up">
					<Image
						src="/ot-logo-natural.svg"
						alt="Open Transport Logo"
						width={130}
						height={96}
						className="h-12 w-auto md:h-16 lg:h-20"
						priority
					/>
						<span className="text-6xl md:text-7xl lg:text-8xl font-bold text-openTransport-neutral">
							Open Transport
						</span>
					</div>

					{/* Subheading */}
					<h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-700 mb-4 animate-fade-in-up animation-delay-200">
						Your journeys, finally in one place
					</h2>

					{/* Catchy Description */}
					<p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
						Connect all your transport accounts and get a unified view of your travel data, spending patterns, and
						environmental impact across every journey.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-600">
						<Button
							size="lg"
							className="bg-openTransport-primary hover:bg-openTransport-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
							onClick={scrollToDemo}
						>
							Try the Demo
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="border-2 border-openTransport-primary/20 hover:border-openTransport-primary/40 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm bg-white/50 hover:bg-white/70 transition-all duration-300"
						>
							Learn More
						</Button>
					</div>

					{/* Feature Highlights */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up animation-delay-800">
						{[
							{ icon: MapPin, title: "Track all journeys", desc: "Every transport mode" },
							{ icon: BarChart3, title: "Analyse spending", desc: "Detailed insights" },
							{ icon: Train, title: "Multiple providers", desc: "All in one place" },
							{ icon: Leaf, title: "CO₂ Impact", desc: "Environmental tracking" },
						].map((feature, index) => (
							<div
								key={index}
								className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
							>
								<div className="bg-openTransport-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
									<feature.icon className="h-6 w-6 text-openTransport-primary" />
								</div>
								<h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
								<p className="text-sm text-gray-600">{feature.desc}</p>
							</div>
						))}
					</div>
				</div>

				{/* Scroll Indicator */}
				<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
					<div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
						<div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
					</div>
				</div>
			</section>

			{/* Demo Accounts Section */}
			<section id="demo-section" className="py-20 bg-white">
				<div className="container mx-auto px-4">
					{/* Section Header */}
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-openTransport-primary/10 text-openTransport-primary border-openTransport-primary/20">
							Interactive Demo
						</Badge>
						<h3 className="text-4xl font-bold text-gray-900 mb-4">Try the Demo</h3>
						<p className="text-xl text-gray-600 mb-2">
							This is a proof-of-concept showcasing unified transport data visualization.
						</p>
						<p className="text-gray-500">
							Choose a demo account to explore the dashboard with realistic transport data.
						</p>
					</div>

					{/* Demo Account Cards */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
						{DEMO_ACCOUNTS.map((account, index) => (
							<Card
								key={account.id}
								className={`group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 transform hover:-translate-y-2 ${selectedAccount === account.account_id
										? "border-openTransport-primary shadow-xl scale-105"
										: "border-transparent hover:border-openTransport-primary/30"
									} bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm`}
								onClick={() => setSelectedAccount(account.account_id)}
								style={{
									animationDelay: `${index * 150}ms`,
								}}
							>
								<CardHeader className="text-center pb-4">
									<div className="mx-auto mb-4 relative">
										<div className="absolute inset-0 bg-openTransport-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300" />
										<Image
											src={account.avatar || "/placeholder.svg"}
											alt={`${account.name} avatar`}
											width={80}
											height={80}
											className="relative rounded-full border-4 border-white shadow-lg"
										/>
									</div>
									<CardTitle className="text-xl group-hover:text-openTransport-primary transition-colors">
										{account.name}
									</CardTitle>
									<CardDescription className="text-sm leading-relaxed">{account.description}</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<Button
										className="w-full group-hover:bg-openTransport-primary group-hover:text-white transition-all duration-300"
										variant={selectedAccount === account.account_id ? "default" : "outline"}
										onClick={(e) => {
											e.stopPropagation()
											handleAccountSelect(account.account_id)
										}}
									>
										{selectedAccount === account.account_id ? "Selected" : "View Dashboard"}
										<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
									</Button>
									<div className="mt-3 text-xs text-gray-500 text-center font-mono bg-gray-50 py-1 px-2 rounded">
										ID: {account.account_id.slice(-8)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Testimonial/Info Section */}
			<section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50/30">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						<Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
							<CardContent className="p-12 text-center">
								<div className="inline-flex items-center bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-6">
									<Train className="h-4 w-4 mr-2" />
									Proof of Concept
								</div>
								<h4 className="text-2xl font-bold text-gray-900 mb-4">Demonstrating Unified Transport Data</h4>
								<p className="text-lg text-gray-600 mb-8 leading-relaxed">
									This demo showcases how transport data from multiple providers can be unified into a single, coherent
									dashboard experience. Real authentication and live data integration coming soon.
								</p>

								{/* Feature Grid */}
								<div className="grid md:grid-cols-3 gap-8 mb-8">
									{[
										{
											icon: MapPin,
											title: "Journey Tracking",
											desc: "Monitor all transport modes in real-time",
											color: "text-openTransport-primary bg-openTransport-primary/10",
										},
										{
											icon: BarChart3,
											title: "Spend Analysis",
											desc: "Track costs and patterns across providers",
											color: "text-openTransport-accent bg-openTransport-accent/10",
										},
										{
											icon: Leaf,
											title: "CO₂ Impact",
											desc: "Environmental footprint monitoring",
											color: "text-green-600 bg-green-100",
										},
									].map((feature, index) => (
										<div key={index} className="text-center">
											<div
												className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${feature.color}`}
											>
												<feature.icon className="h-8 w-8" />
											</div>
											<div className="font-semibold text-gray-900 mb-2">{feature.title}</div>
											<div className="text-sm text-gray-600">{feature.desc}</div>
										</div>
									))}
								</div>

								<div className="text-sm text-gray-500 italic">
									"A glimpse into the future of unified transport data management"
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-openTransport-neutral text-white py-12">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row items-center justify-between">
					<div className="flex items-center space-x-3 mb-6 md:mb-0">
						<Image
							src="/ot-logo-white.svg"
							alt="Open Transport Logo"
							width={36}
							height={28}
							className="h-7 w-auto md:h-8 lg:h-9"
							priority={false}
						/>
						<span className="text-xl font-bold">Open Transport</span>
					</div>

						<div className="flex items-center space-x-6">
							<Link
								href="https://github.com"
								className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
							>
								<Github className="h-5 w-5" />
								<span>GitHub</span>
							</Link>
							<Link
								href="mailto:contact@opentransport.dev"
								className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
							>
								<Mail className="h-5 w-5" />
								<span>Contact</span>
							</Link>
							<Link
								href="https://twitter.com"
								className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
							>
								<Twitter className="h-5 w-5" />
								<span>Twitter</span>
							</Link>
						</div>
					</div>

					<div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
						<p>© 2025 Open Transport. All rights reserved.</p>
					</div>
				</div>
			</footer>

			<style jsx>{`
		@keyframes fade-in {
		  from { opacity: 0; }
		  to { opacity: 1; }
		}

		@keyframes fade-in-up {
		  from {
			opacity: 0;
			transform: translateY(30px);
		  }
		  to {
			opacity: 1;
			transform: translateY(0);
		  }
		}

		.animate-fade-in {
		  animation: fade-in 1s ease-out;
		}

		.animate-fade-in-up {
		  animation: fade-in-up 1s ease-out;
		}

		.animation-delay-200 {
		  animation-delay: 200ms;
		}

		.animation-delay-400 {
		  animation-delay: 400ms;
		}

		.animation-delay-600 {
		  animation-delay: 600ms;
		}

		.animation-delay-800 {
		  animation-delay: 800ms;
		}
	  `}</style>
		</div>
	)
}
