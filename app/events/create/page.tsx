'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CreateEvent = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: 'offline',
        audience: '',
        organizer: '',
    });

    const [tags, setTags] = useState<string[]>(['']);
    const [agenda, setAgenda] = useState<string[]>(['']);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleTagChange = (index: number, value: string) => {
        const updated = [...tags];
        updated[index] = value;
        setTags(updated);
    };

    const addTag = () => setTags([...tags, '']);

    const removeTag = (index: number) => {
        if (tags.length > 1) setTags(tags.filter((_, i) => i !== index));
    };

    const handleAgendaChange = (index: number, value: string) => {
        const updated = [...agenda];
        updated[index] = value;
        setAgenda(updated);
    };

    const addAgenda = () => setAgenda([...agenda, '']);

    const removeAgenda = (index: number) => {
        if (agenda.length > 1) setAgenda(agenda.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (!imageFile) {
                setError('Please upload an event image.');
                setIsSubmitting(false);
                return;
            }

            const filteredTags = tags.filter((t) => t.trim() !== '');
            const filteredAgenda = agenda.filter((a) => a.trim() !== '');

            if (filteredTags.length === 0) {
                setError('Please add at least one tag.');
                setIsSubmitting(false);
                return;
            }

            if (filteredAgenda.length === 0) {
                setError('Please add at least one agenda item.');
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            formData.append('image', imageFile);
            formData.append('tags', JSON.stringify(filteredTags));
            formData.append('agenda', JSON.stringify(filteredAgenda));

            const res = await fetch('/api/events', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Something went wrong');
                setIsSubmitting(false);
                return;
            }

            router.push(`/events/${data.event.slug}`);
        } catch {
            setError('Failed to create event. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto">
            <h1 className="text-center mb-8">Create a New Event</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium">Title</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        maxLength={100}
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. React Summit 2026"
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        maxLength={1000}
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Detailed description of the event..."
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none resize-none"
                    />
                </div>

                {/* Overview */}
                <div className="space-y-2">
                    <label htmlFor="overview" className="block text-sm font-medium">Overview</label>
                    <textarea
                        id="overview"
                        name="overview"
                        required
                        maxLength={500}
                        rows={3}
                        value={form.overview}
                        onChange={handleChange}
                        placeholder="Short overview of the event..."
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none resize-none"
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label htmlFor="image" className="block text-sm font-medium">Event Image</label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#5dfeca] file:text-black file:font-medium file:cursor-pointer"
                    />
                    {imagePreview && (
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            width={400}
                            height={250}
                            className="rounded-lg mt-2 object-cover"
                        />
                    )}
                </div>

                {/* Venue & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="venue" className="block text-sm font-medium">Venue</label>
                        <input
                            id="venue"
                            name="venue"
                            type="text"
                            required
                            value={form.venue}
                            onChange={handleChange}
                            placeholder="e.g. Moscone Center"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="location" className="block text-sm font-medium">Location</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            required
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. San Francisco, CA, USA"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="date" className="block text-sm font-medium">Date</label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            required
                            value={form.date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="time" className="block text-sm font-medium">Time</label>
                        <input
                            id="time"
                            name="time"
                            type="time"
                            required
                            value={form.time}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Mode & Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="mode" className="block text-sm font-medium">Mode</label>
                        <select
                            id="mode"
                            name="mode"
                            required
                            value={form.mode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="audience" className="block text-sm font-medium">Audience</label>
                        <input
                            id="audience"
                            name="audience"
                            type="text"
                            required
                            value={form.audience}
                            onChange={handleChange}
                            placeholder="e.g. Developers, DevOps Engineers"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Organizer */}
                <div className="space-y-2">
                    <label htmlFor="organizer" className="block text-sm font-medium">Organizer</label>
                    <input
                        id="organizer"
                        name="organizer"
                        type="text"
                        required
                        value={form.organizer}
                        onChange={handleChange}
                        placeholder="e.g. GitNation"
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                    />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Tags</label>
                    {tags.map((tag, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => handleTagChange(index, e.target.value)}
                                placeholder={`Tag ${index + 1}`}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                            />
                            {tags.length > 1 && (
                                <button type="button" onClick={() => removeTag(index)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addTag} className="text-[#5dfeca] text-sm hover:underline">+ Add Tag</button>
                </div>

                {/* Agenda */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Agenda</label>
                    {agenda.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleAgendaChange(index, e.target.value)}
                                placeholder={`Agenda item ${index + 1}`}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-[#5dfeca] focus:outline-none"
                            />
                            {agenda.length > 1 && (
                                <button type="button" onClick={() => removeAgenda(index)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addAgenda} className="text-[#5dfeca] text-sm hover:underline">+ Add Agenda Item</button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg bg-[#5dfeca] text-black font-semibold hover:bg-[#4de0b5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
            </form>
        </section>
    );
};

export default CreateEvent;
