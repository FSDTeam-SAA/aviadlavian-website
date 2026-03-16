"use client";

import React from "react";
import {
  Target,
  Eye,
  Users,
  BookOpen,
  Award,
  Globe,
  Book,
  Accessibility,
} from "lucide-react";
import {
  aboutUsCoreValues,
  aboutUsImpact,
  aboutUsIntroCards,
  type AboutUsIconName,
} from "./aboutus.data";

const iconMap: Record<AboutUsIconName, React.ElementType> = {
  target: Target,
  eye: Eye,
  users: Users,
  bookOpen: BookOpen,
  award: Award,
  globe: Globe,
  book: Book,
  accessibility: Accessibility,
};

const Aboutus = () => {
  return (
    <div className="w-full  mx-auto p-6 space-y-8 font-sans">
      <h1 className="text-3xl font-bold text-slate-800">About Us</h1>

      {/* Mission & Vision Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aboutUsIntroCards.map((card) => {
          const Icon = iconMap[card.icon];

          return (
            <div
              key={card.title}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-full">
                  <Icon className="w-6 h-6 text-[#24b4a5]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {card.title}
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Platform Impact Section */}
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            {aboutUsImpact.title}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            {aboutUsImpact.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {aboutUsImpact.stats.map((stat) => {
            const Icon = iconMap[stat.icon];

            return (
              <div key={stat.label} className="space-y-3">
                <div className="flex justify-center">
                  <Icon className="w-10 h-10 text-slate-700" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our Core Values Section */}
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center space-y-12">
        <h2 className="text-2xl font-bold text-slate-800">Our Core Values</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {aboutUsCoreValues.map((value) => {
            const Icon = iconMap[value.icon];

            return (
              <div key={value.title} className="space-y-4">
                <div className="flex justify-center">
                  <Icon className="w-10 h-10 text-slate-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    {value.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed px-4">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Aboutus;
