import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createDocument } from '@/api/endpoints/documents';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/authStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'text/plain': ['.txt'],
};

const formSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    visibility: z.enum(['PRIVATE', 'LECTURER', 'ADMIN']),
    file: z.instanceof(File, { message: 'File is required' })
        .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
});

interface DocumentUploadProps {
    onSuccess?: () => void;
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [preview, setPreview] = useState<string | null>(null);

    // build schema with localized messages
    const formSchema = z.object({
        category: z.string().min(1, t('pages.documentsValidationCategory', 'Category is required')),
        description: z.string().min(1, t('pages.documentsValidationDescription', 'Description is required')),
        visibility: z.enum(['PRIVATE', 'LECTURER', 'ADMIN']),
        file: z.instanceof(File, { message: t('pages.documentsValidationFile', 'File is required') })
            .refine((file) => file.size <= MAX_FILE_SIZE, t('pages.documentsValidationMaxSize', 'Max file size is 5MB.'))
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: '',
            description: '',
            visibility: 'PRIVATE',
        },
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                form.setValue('file', file);
                form.clearErrors('file');

                // Create preview for images
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                } else {
                    setPreview(null);
                }
            }
        },
        accept: ACCEPTED_FILE_TYPES,
        maxFiles: 1,
    });

    const createMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            let kind = 'OTHER';
            let description = values.description;

            // Map UI category to API kind and description prefix
            switch (values.category) {
                case 'CONSENT':
                    kind = 'CONSENT';
                    break;
                case 'ID':
                    kind = 'ID';
                    break;
                case 'STUDENT_DOC':
                    kind = 'OTHER';
                    description = `[Student Doc] ${description}`;
                    break;
                case 'COURSE_MATERIAL':
                    kind = 'OTHER';
                    description = `[Course Material] ${description}`;
                    break;
                case 'ADMINISTRATIVE':
                    kind = 'OTHER';
                    description = `[Admin] ${description}`;
                    break;
                case 'CERTIFICATE':
                    kind = 'OTHER';
                    description = `[Certificate] ${description}`;
                    break;
                default:
                    kind = 'OTHER';
            }

            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            return createDocument({
                kind,
                description,
                file: values.file,
                visibility: values.visibility,
                owner: user.id,
            });
        },
            onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast({ title: t('pages.documentsUploadedTitle', 'Success'), description: t('pages.documentsUploadedDescription', 'Document uploaded successfully') });
            form.reset();
            setPreview(null);
            onSuccess?.();
        },
        onError: (error) => {
            toast({ title: t('pages.documentsErrorTitle', 'Error'), description: getErrorMessage(error), variant: 'destructive' });
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createMutation.mutate(values);
    };

    const selectedFile = form.watch('file');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('pages.documentsFieldCategory', 'Category')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('pages.documentsSelectCategoryPlaceholder', 'Select category')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="STUDENT_DOC">{t('pages.documentsCategory_STUDENT_DOC', 'Student Document')}</SelectItem>
                                    <SelectItem value="COURSE_MATERIAL">{t('pages.documentsCategory_COURSE_MATERIAL', 'Course Material')}</SelectItem>
                                    <SelectItem value="ADMINISTRATIVE">{t('pages.documentsCategory_ADMINISTRATIVE', 'Administrative')}</SelectItem>
                                    <SelectItem value="CERTIFICATE">{t('pages.documentsCategory_CERTIFICATE', 'Certificate')}</SelectItem>
                                    <SelectItem value="CONSENT">{t('pages.documentsCategory_CONSENT', 'Consent Form')}</SelectItem>
                                    <SelectItem value="ID">{t('pages.documentsCategory_ID', 'ID Document')}</SelectItem>
                                    <SelectItem value="OTHER">{t('pages.documentsCategory_OTHER', 'Other')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('pages.documentsFieldDescription', 'Description')}</FormLabel>
                            <FormControl>
                                <Textarea placeholder={t('pages.documentsDescriptionPlaceholder', 'Enter document description...')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('pages.documentsFieldVisibility', 'Visibility')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('pages.documentsSelectVisibilityPlaceholder', 'Select visibility')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PRIVATE">{t('pages.documentsVisibility_Private', 'Private')}</SelectItem>
                                    <SelectItem value="LECTURER">{t('pages.documentsVisibility_Lecturer', 'Lecturer')}</SelectItem>
                                    <SelectItem value="ADMIN">{t('pages.documentsVisibility_Admin', 'Admin')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        {preview ? (
                            <img src={preview} alt="Preview" className="h-32 object-contain rounded-md" />
                        ) : selectedFile ? (
                            <FileText className="h-12 w-12 text-muted-foreground" />
                        ) : (
                            <Upload className="h-12 w-12 text-muted-foreground" />
                        )}

                        {selectedFile ? (
                            <div className="text-sm">
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium">{t('pages.documentsDragDrop', 'Drag & drop a file here, or click to select')}</p>
                                <p className="text-xs mt-1">
                                    {t('pages.documentsAcceptedTypes', 'PDF, DOCX, JPG, PNG up to 5MB')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {form.formState.errors.file && (
                    <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.file.message}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    {selectedFile && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                form.resetField('file');
                                setPreview(null);
                            }}
                        >
                            {t('pages.documentsRemoveFile', 'Remove File')}
                        </Button>
                    )}
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? t('pages.documentsUploading', 'Uploading...') : t('pages.documentsUploadButton', 'Upload Document')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
