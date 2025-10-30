'use client'
import React, { useState } from 'react'
import Image from "next/image";

export const ApieMusContentSprendimai = () => {
    // --- State & Helpers ---
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

    const ICON_STYLE: React.CSSProperties = {
        width: '10vw',
        height: '10vh',
        filter: 'grayscale(100%) brightness(0)',
    }

    const SERVICES = [
        {
            id: 'service-1',
            title: 'Įvairios įrangos montavimas ir priežiūra',
            subtitle: 'Montuojame ir prižiūrime statybos objektuose naudojamą įrangą',
            icon: (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/icons/mirp.svg"
                        alt="Įrangos montavimas"
                        style={ICON_STYLE}
                    />
                </>
            ),
            details: (
                <>
                    <p className="mb-4">
                        Darbo pobūdis apima statybos objektuose naudojamos įvairios įrangos montavimą, paleidimą,
                        techninę priežiūrą ir remontą. Tai gali būti elektros skydai, siurbliai, ventiliacijos
                        ir šildymo sistemos, automatinio valdymo įranga, statybiniai keltuvai ar kita mechaninė
                        įranga…
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Garo turbinų montavimo darbai</li>
                        <li>Šilumokaičių ir katilų montavimas ir priežiūra</li>
                        <li>Pagalbinės įrangos ir vamzdynų montavimas</li>
                        <li>Techninė priežiūra ir remonto darbai</li>
                    </ul>
                </>
            ),
        },
        {
            id: 'service-2',
            title: 'Metalinių konstrukcijų gamyba ir montavimas',
            subtitle: 'Žemės ūkio, pramoninių ar pastatų metalinių konstrukcijų pilnas ciklas',
            icon: (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/icons/kbmon.svg"
                        alt="Konstrukcijų gamyba"
                        style={ICON_STYLE}
                    />
                </>
            ),
            details: (
                <>
                    <p className="mb-4">
                        Įvairių metalinių konstrukcijų gamyba dirbtuvėse bei jų montavimas statybos objektuose…
                    </p>
                    <p className="font-semibold mb-2">Pagrindinės atsakomybės:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Metalinių detalių gamyba pagal brėžinius ar techninę dokumentaciją</li>
                        <li>Konstrukcijų surinkimas ir suvirinimas gamybos ceche arba objekte</li>
                        <li>Paruoštų elementų montavimas statybos aikštelėje</li>
                        <li>Darbas su metalo apdirbimo įranga</li>
                        <li>Kokybės, saugos ir technologinių procesų laikymasis</li>
                    </ul>
                </>
            ),
        },
        {
            id: 'service-3',
            title: 'Technologinių sprendimų projektavimas',
            subtitle: 'Projektuojame efektyvias, ekonomiškai pagrįstas technologines sistemas',
            icon: (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/icons/tpsp.svg"
                        alt="Sprendimų projektavimas"
                        style={ICON_STYLE}
                    />
                </>
            ),
            details: (
                <>
                    <p className="mb-4">
                        Technologinių procesų, inžinerinių sistemų ar gamybos linijų projektavimas pagal klientų poreikius…
                    </p>
                    <p className="font-semibold mb-2">Pagrindinės atsakomybės:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Procesų ir sistemų projektavimas (gamybos, vėdinimo, šildymo...)</li>
                        <li>Sprendimų skaičiavimai ir optimizavimas</li>
                        <li>Techninės dokumentacijos ruošimas</li>
                        <li>Bendradarbiavimas su architektais, inžinieriais</li>
                        <li>Sprendimų derinimas su užsakovu</li>
                    </ul>
                </>
            ),
        },
        {
            id: 'service-4',
            title: 'Inžinerinių / Statybos projektų valdymas',
            subtitle: 'Pilnas projektų ciklas: planavimas, koordinavimas, įgyvendinimas',
            icon: (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/icons/vald.svg"
                        alt="Projektų valdymas"
                        style={ICON_STYLE}
                    />
                </>
            ),
            details: (
                <>
                    <p className="mb-4">
                        Visapusiškas inžinerinių arba statybos projektų planavimas, koordinavimas, priežiūra…
                    </p>
                    <p className="font-semibold mb-2">Pagrindinės atsakomybės:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Darbų grafiko sudarymas ir sąnaudų skaičiavimas</li>
                        <li>Terminų, biudžeto ir kokybės kontrolė</li>
                        <li>Derybos su užsakovais ir subrangovais</li>
                        <li>Dokumentacijos priežiūra ir pokyčių valdymas</li>
                        <li>Objekto kokybės ir saugos kontrolė</li>
                    </ul>
                </>
            ),
        },
    ]

    const selectedService = SERVICES.find(s => s.id === selectedServiceId)

    // --- Reusable sub‐components ---
    const ServiceCard = ({
        title,
        subtitle,
        icon,
        onClick,
    }: {
        title: string
        subtitle: string
        icon: React.ReactNode
        onClick: () => void
    }) => (
        <div
            onClick={onClick}
            className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105 duration-200 p-6 flex flex-col justify-between"
        >
            <div className="flex items-center px-[2vw]">
                <div className="mr-4">{icon}</div>
                <div>
                    <h3 className="text-[2.5vh] font-semibold mb-2">{title}</h3>
                    <p className="text-gray-600 text-[2vh]">{subtitle}</p>
                </div>
                <div className="mt-4 pl-[3vw] text-teal-600">
                    <div className="relative w-[8vw] h-[8vh] filter brightness-0">
                        <Image
                            src="/icons/arrow.svg"
                            alt="Arrow"
                            fill
                            style={{ objectFit: "contain" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const ServiceModal = ({
        isOpen,
        onClose,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        children: React.ReactNode
    }) => {
        if (!isOpen) return null
        return (
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto shadow-xl"
                >
                    <button onClick={onClose} className="float-right text-2xl leading-none">
                        &times;
                    </button>
                    <div className="mt-4">{children}</div>
                </div>
            </div>
        )
    }

    // --- Render ---
    return (
        <section>
            <div className="flex flex-wrap gap-4">
                {SERVICES.map((service) => (
                    <div key={service.id} className="w-1/2">
                        <ServiceCard
                            title={service.title}
                            subtitle={service.subtitle}
                            icon={service.icon}
                            onClick={() => setSelectedServiceId(service.id)}
                        />
                    </div>
                ))}
            </div>

            <ServiceModal
                isOpen={!!selectedServiceId}
                onClose={() => setSelectedServiceId(null)}
            >
                {selectedService && (
                    <>
                        <h2 className="text-neutral-900 text-xl font-bold mb-4">
                            {selectedService.title}
                        </h2>
                        {selectedService.details}
                    </>
                )}
            </ServiceModal>
        </section>

    )
}
