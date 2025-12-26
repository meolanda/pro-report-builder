-- Create reports table for storing job information
CREATE TABLE public.reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    client_name TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    reporter_name TEXT,
    logo_url TEXT,
    conclusion TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sections table
CREATE TABLE public.report_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create images table
CREATE TABLE public.report_images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES public.report_sections(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this app)
CREATE POLICY "Anyone can view reports" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update reports" 
ON public.reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete reports" 
ON public.reports 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view sections" 
ON public.report_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create sections" 
ON public.report_sections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update sections" 
ON public.report_sections 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete sections" 
ON public.report_sections 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view images" 
ON public.report_images 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create images" 
ON public.report_images 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update images" 
ON public.report_images 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete images" 
ON public.report_images 
FOR DELETE 
USING (true);

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);

-- Storage policies
CREATE POLICY "Anyone can view report images"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY "Anyone can upload report images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Anyone can update report images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'report-images');

CREATE POLICY "Anyone can delete report images"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();