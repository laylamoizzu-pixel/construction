"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <section className="bg-brand-dark text-white py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Visit <span className="text-brand-gold">Us</span></h1>
                <p className="text-gray-300">We love to hear from our customers. Here&apos;s how you can reach us.</p>
            </section>

            <div className="container mx-auto px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-6">Store Information</h2>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl"
                        >
                            <div className="p-3 bg-brand-green/10 text-brand-green rounded-full">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Address</h3>
                                <p className="text-gray-600">
                                    Smart Avenue Retail Complex,<br />
                                    Level 3, P&M Mall, Patliputra Colony,<br />
                                    Patna, Bihar 800013
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl"
                        >
                            <div className="p-3 bg-brand-green/10 text-brand-green rounded-full">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Phone</h3>
                                <p className="text-gray-600">+91 612 2xxx xxx (Store)</p>
                                <p className="text-gray-600">+91 98xxx xxxxx (Support)</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl"
                        >
                            <div className="p-3 bg-brand-green/10 text-brand-green rounded-full">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Opening Hours</h3>
                                <p className="text-gray-600">Monday - Sunday</p>
                                <p className="font-semibold text-brand-green">10:00 AM - 10:00 PM</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl"
                        >
                            <div className="p-3 bg-brand-green/10 text-brand-green rounded-full">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Email</h3>
                                <p className="text-gray-600">support@smartavenue.com</p>
                                <p className="text-gray-600">careers@smartavenue.com</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Map Embed */}
                    <div className="h-full min-h-[400px] w-full bg-gray-200 rounded-3xl overflow-hidden shadow-lg relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115133.01016839848!2d85.07300225139396!3d25.608020764124317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x831218527871363d!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1717758362706!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
